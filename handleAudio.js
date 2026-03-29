let intonation = document.getElementById("intonation");
let extraInfo = document.getElementById("extraInfo");
let displayNote = document.getElementById("displayNote");
const canv = document.getElementById("scale");
const cont = canv.getContext("2d");

window.addEventListener("load", async function(){
  let stream = null;

  try{
    stream = await navigator.mediaDevices.getUserMedia({audio:true, video:false});
    

    const audioCont = new AudioContext();
    const analyser = audioCont.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -50;

    const source = audioCont.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const notes = ["A", "A#/Bb", "B", "C", "C#/Db", "D", "D#/Eb", "E", "F", "F#/Gb", "G", "G#/Ab"]
    
    function lowestPositive(n1, n2){
      if (n1 >= 0 && n1 < n2){
        return n1;
      }
      return n2;
    };

    function getFrequencies(){
      analyser.getByteFrequencyData(dataArray);

      let loudestFrequency = 0;
      for (let i = 0; i < dataArray.length; i ++){
        if (dataArray[i] > dataArray[loudestFrequency]){
          loudestFrequency = i;
        }
      }

      let actualFrequency = (loudestFrequency / dataArray.length) * 0.5 * audioCont.sampleRate;

      let semitonesFromA = 12 * (Math.log(actualFrequency / 440) / Math.log(2));
      let nearestNoteFrequency = 440 * Math.pow(2, Math.round(semitonesFromA) / 12);

      let noteIndex = Math.round(semitonesFromA) % 12;
      let note = notes[lowestPositive(noteIndex, noteIndex + 12)]; 
      let octave = Math.round(semitonesFromA / 12) + 4;
      let centDeviation = 1200 * (Math.log(actualFrequency / nearestNoteFrequency) / Math.log(2));
      
      displayNote.innerHTML = note + octave;
      extraInfo.innerHTML = "<pre>" + 
        "             FREQUENCY: " + actualFrequency + "<br>" +
        "NEAREST NOTE FREQUENCY: " + nearestNoteFrequency + "<br>" +
        "     SEMITONES FROM A4: " + semitonesFromA + "<br>" +
        "        CENT DEVIATION: " + centDeviation + "</pre>";
      
      if (centDeviation > 0){
        intonation.innerHTML = "SHARP <br> +" + Math.abs(centDeviation) + " CENTS";
      }else
      if (centDeviation < 0){
        intonation.innerHTML = "FLAT <br> -" + Math.abs(centDeviation) + " CENTS";
      }else
      if (centDeviation == 0){
        intonation.innerHTML = "PERFECTLY IN TUNE<br>" + Math.abs(centDeviation) + " CENTS";
      }else{
        intonation.innerHTML = "NOT PLAYING<br>" + "NAN CENTS";
      }
      
      canv.width = Math.min(150, window.innerWidth);
      canv.height = window.innerHeight / 2;
      cont.clearRect(0, 0, canv.width, canv.height);
      
      const grad = cont.createLinearGradient(0, 0, 0, canv.height);
      grad.addColorStop(0, "rgb(255, 0, 0)");
      grad.addColorStop(0.5, "rgb(0, 255, 0)");
      grad.addColorStop(1, "rgb(255, 0, 0)");

      cont.fillStyle = grad;
      cont.fillRect(0, 0, canv.width, canv.height);

      cont.fillStyle = "rgb(0, 0, 0)";
      cont.fillRect(0, canv.height / 2, canv.width, 5);

      cont.fillStyle = "rgb(0, 0, 255)";
      cont.fillRect(0, centDeviation / 50 * canv.height / 2 + canv.height / 2, canv.width, 5);

      requestAnimationFrame(getFrequencies);
    }
    getFrequencies();
  }catch(err){
    if (err.name == "NotAllowedError"){
      intonation.innerHTML = 'A HORRIBLE PERSON WHO DOESNT WANT TO TUNE. I BET YOURE AT LEAST 20 CENTS SHARP RIGHT NOW AND YOURE JUST GOING TO IGNORE IT LIKE SOME LOWLY, GOOD FOR NOTHING, SCOUNDREL. IS THAT WHO YOU WANT TO BE????? THERE ARE THOUSANDS, PROBABLY MILLIONS OF OTHER PEOPLE USING A TUNER. REGARDLESS OF WHETHER THEY ARE A MUSICIAN OR NOT, THEY ARE GETTING BETTER THAN YOU. WHATS THAT YOU SAY?? YOURE WORRIED ABOUT YOUR PRIVACY??? WELL ILL HAVE YOU KNOW THAT THE AUDIO THIS WEBSITE IS RECORDING WILL NEVER BE STORED AND WILL BE DELETED WHEN YOU CLOSE THE TAB. SO REFRESH THE PAGE RIGHT THIS INSTANT, ACCEPT THE MICROPHONE USAGE PROMPT AND TUNE, YOU FUCK';
    }else{
      intonation.innerHTML = err;
    }
  }
});

