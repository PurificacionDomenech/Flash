registerIndicator({
    name: "Flash",
    description: "Marca el High y Low de la vela anterior a una hora específica",
    parameters: {
        hora: {
            type: "string",
            default: "15:30"
        }
    },

    initialize: function () {
        this.highLevel = null;
        this.lowLevel = null;
        this.levelsFixed = false;
    },

    calculate: function (bars, params) {
        const results = [];

        const targetHour = params.hora;

        for (let i = 1; i < bars.length; i++) {
            const bar = bars[i];
            const prevBar = bars[i - 1];

            const date = new Date(bar.time);
            const hh = String(date.getHours()).padStart(2, "0");
            const mm = String(date.getMinutes()).padStart(2, "0");
            const currentTime = `${hh}:${mm}`;

            // Cuando llega la hora indicada y aún no se fijaron niveles
            if (currentTime === targetHour && !this.levelsFixed) {
                this.highLevel = prevBar.high;
                this.lowLevel = prevBar.low;
                this.levelsFixed = true;
            }

            results.push({
                highLine: this.highLevel,
                lowLine: this.lowLevel
            });
        }

        return results;
    },

    plots: {
        highLine: {
            title: "Flash High",
            color: "#00FF00",
            lineWidth: 2
        },
        lowLine: {
            title: "Flash Low",
            color: "#FF0000",
            lineWidth: 2
        }
    }
});
