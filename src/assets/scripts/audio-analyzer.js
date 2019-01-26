import { GLOBAL } from './global';

export default class AudioAnalyzer{

    constructor(){

        const self = this;

        // Создание источника
        this.audio = new Audio();
        // костыль для гитхаба
        if(window.location.host === 'kozlov-a-d.github.io'){
            this.audio.src = "dist/assets/audio/sod-lonely-day.mp3"; 
        } else {
            this.audio.src = "assets/audio/sod-lonely-day.mp3"; 
        }
        
        // this.audio.src = "assets/audio/song.mp3";   
        this.controls = true;

        this.createAudioContext();
        this.createAudioAnalyzer();
        this.appendHTML();
        
        this.update = function (bands) {
            GLOBAL.bands = bands;
            // console.log(bands);
        };

        this.audio.addEventListener('canplay', this.onPlay.bind(self));
    }


    createAudioContext(){
        let AudioContext = window.AudioContext || window.webkitAudioContext;
        this.context = new AudioContext();
        this.node = this.context.createScriptProcessor(2048, 1, 1);
    }


    createAudioAnalyzer(){
        this.analyser = this.context.createAnalyser();
        this.analyser.smoothingTimeConstant = 0.1;
        this.analyser.fftSize = 256;  // размерность преобразования Фурье (грубо говоря, этот параметр указывает, сколько данных мы хотим получить в результате частотного анализа сигнала, это кол-во будет равно fftSize/2)
        this.bands = new Uint8Array(this.analyser.frequencyBinCount);
    }


    appendHTML(){
        document.body.appendChild(this.audio);
        this.audio.controls = true;
        // this.audio.autoplay = true;
    }

    onPlay(){
        // отправляем на обработку в  AudioContext 
        this.source = this.context.createMediaElementSource(this.audio);
        // связываем источник и анализатором
        this.source.connect(this.analyser);
        // связываем анализатор с интерфейсом, из которого он будет получать данные
        this.analyser.connect(this.node);
        // Связываем все с выходом
        this.node.connect(this.context.destination);
        this.source.connect(this.context.destination);
        // подписываемся на событие изменения входных данных
        this.node.onaudioprocess = () => {
            this.analyser.getByteFrequencyData(this.bands);
            if (!this.audio.paused) {
                if (typeof this.update === "function") {
                    return this.update(this.bands);
                } else {
                    return 0;
                }
            }
        };
    }

}