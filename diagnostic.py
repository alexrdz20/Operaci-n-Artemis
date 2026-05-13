from pyDatalog import pyDatalog

# 1. Definición de términos y variables
pyDatalog.create_terms('X, Y, Z, Camino, Resto, conexion, nodo_danado, ruta_energia')

# 2. Hechos: Mapeo de la red de la nave Orion
+conexion('paneles', 'rele_a')
+conexion('paneles', 'rele_b')
+conexion('rele_a', 'rele_c')
+conexion('rele_a', 'mod_servicio')
+conexion('rele_b', 'mod_servicio')
+conexion('rele_c', 'sop_vital')
+conexion('rele_c', 'mod_comando')
+conexion('mod_servicio', 'mod_comando')

# 3. Hechos: Estados de falla (Radiación detectada)
+nodo_danado('rele_b')
+nodo_danado('mod_servicio')

# 4. Reglas: Inferencia de ruta segura (Algoritmo Recursivo con rastreo de camino)
# pyDatalog permite usar listas para construir el camino
# -- REGLA DE ENRUTAMIENTO SEGURO --
ruta_energia(X, Y, Camino) <= (conexion(X, Y) & ~(nodo_danado(Y)) & (Camino == (X, Y)))

# -- REGLA RECURSIVA (RASTREO DE CAMINO) --
ruta_energia(X, Y, Camino) <= (conexion(X, Z) & ~(nodo_danado(Z)) & ruta_energia(Z, Y, Resto) & (Camino == (X,) + Resto))

# 5. Ejecución de la consulta de recuperación
print("--- SISTEMA DE RECUPERACIÓN ARTEMIS II ---")
print("Buscando ruta desde PANELES hasta SOPORTE VITAL...")

# Realizar la consulta pidiendo el Camino
resultado = ruta_energia('paneles', 'sop_vital', Camino)

if resultado:
    print("\n[ÉXITO] Ruta segura identificada.")
    print(f"CIRCUITO VÁLIDO: {list(resultado[0][0])}")
    print("La lógica deductiva ha evitado los nodos con radiación.")
else:
    print("\n[ERROR] No se encontró una ruta segura. Reservas de O2 críticas.")

