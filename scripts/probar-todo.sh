#!/bin/bash
# Todas las comprobaciones de una. Se corre desde cualquier sitio.
cd "$(dirname "$0")/.." || exit 1
fallos=0
echo "── Contenido ──"
for c in "" v2; do
  printf "  %-9s " "${c:-v1}"
  salida=$(python3 verificar.py $c 2>&1 | sed -n '5p')
  echo "$salida"
  [[ "$salida" == "Sin errores." ]] || fallos=$((fallos+1))
done
echo "── Código ──"
printf "  %-9s " "app.js"
node --check js/app.js && echo "sintaxis OK" || { echo "SINTAXIS MAL"; fallos=$((fallos+1)); }

echo "── Pruebas ──"
for t in probar_bolsa probar_casi probar_ordenar probar_test probar_navegacion probar_respuestas probar_tildes; do
  printf "  %-20s " "$t"
  if node "scripts/$t.js" >/dev/null 2>&1; then echo "OK"; else echo "FALLA"; fallos=$((fallos+1)); fi
done
echo
[[ $fallos -eq 0 ]] && echo "Todo en orden." || echo "$fallos fallo(s)."
exit $fallos
