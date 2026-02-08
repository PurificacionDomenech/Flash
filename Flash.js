// =============================================================================
// INDICADOR: Monarch Band
// Plataforma: Liquid Charts Pro (UDI)
// Autor: Purificación Santana
// Versión: 1.0
// Descripción: Sistema de bandas con Trigger y Average MA con detección de cruces
// =============================================================================

// ==================== INICIALIZACIÓN ====================
UDI.onInit = function(data) {
    return {
        name: "Monarch Band",
        
        // Definir dos líneas
        plots: [
            {type: "line", color: "#00FF00", lineWidth: 2},  // Trigger (verde)
            {type: "line", color: "#FF0000", lineWidth: 2}   // Average (rojo)
        ],
        
        // Parámetros configurables
        settingsFields: [
            {
                id: "triggerType",
                name: "Trigger MA Type",
                type: "select",
                options: ["SMA", "EMA", "WMA"],
                defaultValue: "SMA"
            },
            {
                id: "triggerPeriod",
                name: "Trigger Period",
                type: "integer",
                defaultValue: 12,
                minimum: 1
            },
            {
                id: "averageType",
                name: "Average MA Type",
                type: "select",
                options: ["SMA", "EMA", "WMA"],
                defaultValue: "SMA"
            },
            {
                id: "averagePeriod",
                name: "Average Period",
                type: "integer",
                defaultValue: 12,
                minimum: 1
            },
            {
                id: "drawArrows",
                name: "Draw Arrows",
                type: "boolean",
                defaultValue: true
            }
        ]
    };
};

// ==================== CÁLCULO ====================
UDI.onCalculate = function(data, output) {
    // Obtener parámetros
    var triggerType = data.parameters.triggerType || "SMA";
    var triggerPeriod = data.parameters.triggerPeriod || 12;
    var averageType = data.parameters.averageType || "SMA";
    var averagePeriod = data.parameters.averagePeriod || 12;
    var drawArrows = data.parameters.drawArrows !== false;
    
    // Verificar que tenemos suficientes barras
    if (data.barCount < Math.max(triggerPeriod, averagePeriod + triggerPeriod)) {
        return;
    }
    
    // Calcular Trigger MA sobre precios de cierre
    var triggerValues = calculateMA(data.barData, triggerPeriod, triggerType);
    
    // Calcular Average MA sobre el Trigger
    var averageValues = calculateMAFromArray(triggerValues, averagePeriod, averageType);
    
    // Asignar valores a los plots
    for (var i = 0; i < data.barCount; i++) {
        output.values[0][i] = triggerValues[i];
        output.values[1][i] = averageValues[i];
    }
    
    // Detectar cruces y crear flechas
    if (drawArrows && data.barCount > 1) {
        detectCrossovers(data, triggerValues, averageValues, output);
    }
};

// ==================== FUNCIONES AUXILIARES ====================

// Calcular MA desde barData
function calculateMA(barData, period, maType) {
    var values = [];
    
    for (var i = 0; i < barData.length; i++) {
        if (i < period - 1) {
            values.push(null);
            continue;
        }
        
        if (maType === "SMA") {
            var sum = 0;
            for (var j = 0; j < period; j++) {
                sum += barData[i - j].close;
            }
            values.push(sum / period);
        } 
        else if (maType === "EMA") {
            if (i === period - 1) {
                // Primera EMA = SMA
                var sum = 0;
                for (var j = 0; j < period; j++) {
                    sum += barData[i - j].close;
                }
                values.push(sum / period);
            } else {
                var multiplier = 2 / (period + 1);
                var ema = (barData[i].close - values[i - 1]) * multiplier + values[i - 1];
                values.push(ema);
            }
        }
        else if (maType === "WMA") {
            var sum = 0;
            var weightSum = (period * (period + 1)) / 2;
            for (var j = 0; j < period; j++) {
                sum += barData[i - j].close * (period - j);
            }
            values.push(sum / weightSum);
        }
    }
    
    return values;
}

// Calcular MA desde un array de valores
function calculateMAFromArray(sourceArray, period, maType) {
    var values = [];
    
    for (var i = 0; i < sourceArray.length; i++) {
        if (i < period - 1 || sourceArray[i] === null) {
            values.push(null);
            continue;
        }
        
        if (maType === "SMA") {
            var sum = 0;
            var count = 0;
            for (var j = 0; j < period; j++) {
                if (sourceArray[i - j] !== null) {
                    sum += sourceArray[i - j];
                    count++;
                }
            }
            values.push(count > 0 ? sum / count : null);
        } 
        else if (maType === "EMA") {
            if (values[i - 1] === null) {
                // Primera EMA = promedio disponible
                var sum = 0;
                var count = 0;
                for (var j = 0; j < period; j++) {
                    if (sourceArray[i - j] !== null) {
                        sum += sourceArray[i - j];
                        count++;
                    }
                }
                values.push(count > 0 ? sum / count : null);
            } else {
                var multiplier = 2 / (period + 1);
                var ema = (sourceArray[i] - values[i - 1]) * multiplier + values[i - 1];
                values.push(ema);
            }
        }
        else if (maType === "WMA") {
            var sum = 0;
            var weightSum = (period * (period + 1)) / 2;
            var count = 0;
            for (var j = 0; j < period; j++) {
                if (sourceArray[i - j] !== null) {
                    sum += sourceArray[i - j] * (period - j);
                    count++;
                }
            }
            values.push(count > 0 ? sum / weightSum : null);
        }
    }
    
    return values;
}

// Detectar cruces
function detectCrossovers(data, triggerValues, averageValues, output) {
    var lastIdx = data.barCount - 1;
    var prevIdx = lastIdx - 1;
    
    if (prevIdx < 0) return;
    
    var triggerCurrent = triggerValues[lastIdx];
    var averageCurrent = averageValues[lastIdx];
    var triggerPrevious = triggerValues[prevIdx];
    var averagePrevious = averageValues[prevIdx];
    
    if (triggerCurrent === null || averageCurrent === null || 
        triggerPrevious === null || averagePrevious === null) return;
    
    // Cruce alcista (Trigger cruza ARRIBA de Average)
    if (triggerPrevious <= averagePrevious && triggerCurrent > averageCurrent) {
        output.addBar Marker({
            barIndex: prevIdx,
            label: "▲",
            color: "#1E6407",
            position: "below"
        });
        
        output.toast({
            message: "Monarch Band: Cruce Alcista - Trigger cruzó por ENCIMA de Average",
            type: "success"
        });
    }
    
    // Cruce bajista (Trigger cruza ABAJO de Average)
    if (triggerPrevious >= averagePrevious && triggerCurrent < averageCurrent) {
        output.addBarMarker({
            barIndex: prevIdx,
            label: "▼",
            color: "#E91B1B",
            position: "above"
        });
        
        output.toast({
            message: "Monarch Band: Cruce Bajista - Trigger cruzó por DEBAJO de Average",
            type: "warning"
        });
    }
}
