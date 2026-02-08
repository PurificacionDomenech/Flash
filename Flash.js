// =============================================================================
// INDICADOR: Monarch Band
// Plataforma: Liquid Charts Pro (UDI)
// Autor: Purificación Santana
// Versión: 1.0 CORREGIDA
// Descripción: Sistema de bandas con Trigger y Average MA con detección de cruces
// =============================================================================

// ==================== INICIALIZACIÓN ====================
UDI.onInit = function(context) {
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
                id: "triggerPeriod",
                name: "Trigger Period",
                type: "integer",
                defaultValue: 12
            },
            {
                id: "averagePeriod",
                name: "Average Period",
                type: "integer",
                defaultValue: 12
            }
        ]
    };
};

// ==================== CÁLCULO ====================
UDI.onCalculate = function(data, output) {
    // Obtener parámetros
    var triggerPeriod = data.parameters.triggerPeriod || 12;
    var averagePeriod = data.parameters.averagePeriod || 12;
    
    // Verificar que tenemos suficientes barras
    if (data.valueCount < triggerPeriod + averagePeriod) {
        return;
    }
    
    // Calcular Trigger SMA sobre precios de cierre
    for (var i = triggerPeriod - 1; i < data.valueCount; i++) {
        var sum = 0;
        for (var j = 0; j < triggerPeriod; j++) {
            sum += data.barData[i - j].close;
        }
        output.values[0][i] = sum / triggerPeriod;
    }
    
    // Calcular Average SMA sobre el Trigger
    for (var i = triggerPeriod + averagePeriod - 1; i < data.valueCount; i++) {
        var sum = 0;
        for (var j = 0; j < averagePeriod; j++) {
            if (output.values[0][i - j] !== undefined) {
                sum += output.values[0][i - j];
            }
        }
        output.values[1][i] = sum / averagePeriod;
    }
    
    // Detectar cruces en la última barra
    var lastIdx = data.valueCount - 1;
    if (lastIdx > 0) {
        var triggerCurrent = output.values[0][lastIdx];
        var averageCurrent = output.values[1][lastIdx];
        var triggerPrevious = output.values[0][lastIdx - 1];
        var averagePrevious = output.values[1][lastIdx - 1];
        
        if (triggerCurrent && averageCurrent && triggerPrevious && averagePrevious) {
            // Cruce alcista
            if (triggerPrevious <= averagePrevious && triggerCurrent > averageCurrent) {
                output.addBarMarker({
                    barIndex: lastIdx - 1,
                    label: "▲",
                    color: "#00FF00",
                    position: "below"
                });
            }
            
            // Cruce bajista
            if (triggerPrevious >= averagePrevious && triggerCurrent < averageCurrent) {
                output.addBarMarker({
                    barIndex: lastIdx - 1,
                    label: "▼",
                    color: "#FF0000",
                    position: "above"
                });
            }
        }
    }
};
