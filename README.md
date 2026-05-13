# Operación Artemis-Log: Sistema de Diagnóstico de Red

Este programa es una herramienta de simulación y diagnóstico diseñada para encontrar rutas seguras de energía y datos en la cápsula Orion (Misión Artemis II) tras un incidente de radiación.

## Funcionalidades
- **Base de Datos Deductiva:** Utiliza `pyDatalog` para mapear la red de la nave y aplicar reglas recursivas que evitan nodos dañados.
- **Interfaz HUD Interactiva:** Un panel visual en HTML/JS que muestra el estado de la red, la lógica de hechos y el motor de inferencia en tiempo real.
- **Secuencia de Reporte:** Automatización de 90 segundos diseñada para presentaciones de diagnóstico técnico.

## Instrucciones de Uso
1. **Visualización:** Abrir el archivo `index.html` en cualquier navegador moderno para iniciar el HUD interactivo.
2. **Lógica en Python:** Ejecutar `python diagnostic.py` para ver la resolución de la ruta segura directamente en la terminal utilizando lógica computacional deductiva.

---
*Desarrollado para la cátedra de Sistemas de Bases de Datos II - UNEG.*
