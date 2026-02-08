registerIndicator({
    name: "Flash",
    description: "Marca el máximo y mínimo de la vela anterior a una hora específica",

    inputs: [
        {
            id: "hora",
            name: "Hora objetivo (HH:MM)",
            type: "string",
            defaultValue: "15:30"
        }
    ],

    plots: [
        { id: "highLine", name: "Flash High" },
        { id: "lowLine", name: "Flash Low" }
    ],

    styles: {
        highLine: {
            color: "#00FF00",
            lineWidth: 2
        },
        lowLine: {
            color: "#FF0000",
            lineWidth: 2
        }
    },

    init: function () {
        this.highLevel = null;
        this.lowLevel = null;
        this.fixed = false;
    },

    map: function (bar, index, history) {
        if (index === 0) {
            return {};
        }

        const horaObjetivo = this.inputs.hora;

        const date = new Date(bar.time);
        const hh = String(date.getHours()).padStart(2, "0");
        const mm = String(date.getMinutes()).padStart(2, "0");
        const horaActual = `${hh}:${mm}`;

        if (horaActual === horaObjetivo && !this.fixed) {
            const prevBar = history[index - 1];
            this.highLevel = prevBar.high;
            this.lowLevel = prevBar.low;
            this.fixed = true;
        }

        return {
            highLine: this.highLevel,
            lowLine: this.lowLevel
        };
    }
});
