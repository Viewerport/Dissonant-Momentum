let intonation = document.getElementById("intonation");
let extraInfo = document.getElementById("extraInfo");

window.addEventListener("load", async function(){
  let stream = null;

  try{
    stream = await navigator.mediaDevices.getUserMedia({audio:true, video:false});
    

    const audioCont = new AudioContext();
    const analyser = audioCont.createAnalyser();
    analyser.fftSize = 32768;
    analyser.minDecibels = -80;

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

      extraInfo.innerHTML = 
        "NOTE: " + note + octave + "<br>" + 
        "FREQUENCY: " + actualFrequency + "<br>" +
        "NEAREST NOTE FREQUENCY: " + nearestNoteFrequency + "<br>" +
        "SEMITONES FROM A4: " + semitonesFromA + "<br>" +
        "CENT DEVIATION: " + centDeviation;

      if (centDeviation > 0){
        intonation.innerHTML = "SHARP <br> +" + Math.abs(centDeviation) + " CENTS";
      }else
      if (centDeviation < 0){
        intonation.innerHTML = "FLAT <br> -" + Math.abs(centDeviation) + " CENTS";
      }else{
        intonation.innerHTML = "AMAZING BECAUSE YOU ARE PERFECTLY IN TUNE!!!!!!<br>" + "0 CENTS";
      }

      requestAnimationFrame(getFrequencies);
    }
    getFrequencies();
  }catch(err){
    if (err.name == "NotAllowedError"){
      intonation.innerHTML = 'A HORRIBLE PERSON WHO DOESNT WANT TO TUNE. I BET YOURE AT LEAST 20 CENTS SHARP RIGHT NOW AND YOURE JUST GOING TO IGNORE IT LIKE SOME LOWLY, GOOD FOR NOTHING, SCOUNDREL. IS THAT WHO YOU WANT TO BE????? THERE ARE THOUSANDS, PROBABLY MILLIONS OF OTHER PEOPLE USING A TUNER. REGARDLESS OF WHETHER THEY ARE A MUSICIAN OR NOT, THEY ARE GETTING BETTER THAN YOU. WHATS THAT YOU SAY?? YOURE WORRIED ABOUT YOUR PRIVACY??? WELL (if youre in the united states) TELL YOUR STATE REPRESENTATIVE TO VOTE AGAINST LAWS SUCH AS THE APP STORE ACCOUNTABILITY ACT. THIS LAW WOULD FORCE APP STORES, LIKE THE "APP STORE" FOR APPLE DEVICES AND THE "GOOGLE PLAY STORE" FOR GOOGLE DEVICES, TO PROVIDE A FORM TO VERIFY YOUR AGE. THE FORM WOULD MAKE YOU SUBMIT EITHER A PICTURE OF YOURSELF OR YOUR GOVERNMENT ID. IF YOU SUBMIT A PICTURE OF YOURSELF, THE APP STORE NEEDS TO SEND THAT PICTURE TO A THIRD PARTY SO THEY CAN VERIFY YOUR AGE. THAT THIRD PARTY CAN STORE THAT PICTURE OF YOU. ON THE OTHER HAND, IF YOU SUBMIT A PICTURE OF YOUR GOVERNMENT ID, THE APP STORE CAN STORE THAT AS WELL. THE PLACES THEY STORE THAT DATA ARE VULNERABLE. IN FEBRUARY OF 2026, A FACIAL VERIFICATION COMPANY KNOWN AS "PERSONA" HAD A DATA BREACH. ARE YOU WILLING PUT YOUR IDENTITY IN THE HANDS OF COMPANIES NOTORIOUS FOR THEIR EXCESSIVE SURVEILANCE????? IF NOT, EMAIL, CALL, OR TALK WITH YOUR STATE REPRESENTATIVE AND USE YOUR VOICE. OH, I DIDNT REPOND TO YOUR CONCERN????? WELL ILL HAVE YOU KNOW THAT THE AUDIO THIS WEBSITE IS RECORDING WILL NEVER BE STORED AND WILL BE DELETED WHEN YOU CLOSE THE TAB. SO REFRESH THE PAGE RIGHT THIS INSTANT, ACCEPT THE MICROPHONE USAGE PROMPT AND TUNE, YOU FUCK';
    }
  }
});

