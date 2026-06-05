#!/bin/bash
# Backup automático de PostgreSQL
# Uso: ./scripts/backup_db.sh
# Cron diario: 0 3 * * * /ruta/al/proyecto/scripts/backup_db.sh

set -e

BACKUP_DIR="./backups"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
FILE="$BACKUP_DIR/elitiandb_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

# Ejecuta pg_dump dentro del contenedor de la base de datos
docker compose exec -T db pg_dump \
  -U "$DB_USER" \
  -d "$DB_NAME" \
  | gzip > "$FILE"

echo "Backup guardado: $FILE"

# Elimina backups con más de 30 días
find "$BACKUP_DIR" -name "elitiandb_*.sql.gz" -mtime +30 -delete
echo "Backups viejos limpiados."
