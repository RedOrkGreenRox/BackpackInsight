"""profile timestamps, unique user_id index, pg_trgm search indexes

Revision ID: 0002
Revises: 0001
Create Date: 2026-06-15 02:10:00

Изменения:
1. profile.created_at / updated_at — поддержка upsert-семантики и политики хранения (TTL).
2. Частичный уникальный индекс по profile.user_id — защита от дублей профиля одного игрока
   (NULL-значения допускаются, поэтому индекс частичный: WHERE user_id IS NOT NULL).
3. Расширение pg_trgm + GIN-индексы на itemdefinition(name, item_id) для быстрого поиска.
   Раньше создавались в коде приложения при старте; теперь — в миграции, чтобы схема БД
   была самодостаточной и индексы существовали сразу после `alembic upgrade head`
   (без ожидания старта приложения).
"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
import sqlmodel


# revision identifiers, used by Alembic.
revision: str = '0002'
down_revision: Union[str, Sequence[str], None] = '0001'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _dialect() -> str:
    bind = op.get_bind()
    return bind.dialect.name


def upgrade() -> None:
    """Upgrade schema."""
    dialect = _dialect()

    # --- 1. Таймстампы на profile ---
    # server_default=func.now() бэкфиллит существующие строки текущим временем.
    op.add_column(
        'profile',
        sa.Column('created_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )
    op.add_column(
        'profile',
        sa.Column('updated_at', sa.DateTime(), nullable=False, server_default=sa.func.now()),
    )

    # --- 2. Частичный уникальный индекс по user_id ---
    # Допускает несколько NULL (профили без UID), но запрещает дубли одного UID.
    op.create_index(
        'uix_profile_user_id',
        'profile',
        ['user_id'],
        unique=True,
        postgresql_where=sa.text('user_id IS NOT NULL'),
        sqlite_where=sa.text('user_id IS NOT NULL'),
    )

    # --- 3. pg_trgm + GIN-индексы (только PostgreSQL) ---
    # GIN-индексы на itemdefinition дают быстрый нечёткий/полнотекстовый поиск.
    if dialect == 'postgresql':
        op.execute('CREATE EXTENSION IF NOT EXISTS pg_trgm')
        op.execute(
            'CREATE INDEX IF NOT EXISTS idx_itemdefinition_name_trgm '
            'ON itemdefinition USING gin (name gin_trgm_ops)'
        )
        op.execute(
            'CREATE INDEX IF NOT EXISTS idx_itemdefinition_id_trgm '
            'ON itemdefinition USING gin (item_id gin_trgm_ops)'
        )


def downgrade() -> None:
    """Downgrade schema."""
    dialect = _dialect()

    if dialect == 'postgresql':
        op.execute('DROP INDEX IF EXISTS idx_itemdefinition_id_trgm')
        op.execute('DROP INDEX IF EXISTS idx_itemdefinition_name_trgm')
        # Расширение pg_trgm не удаляем — оно может использоваться другими объектами.

    op.drop_index('uix_profile_user_id', table_name='profile')

    op.drop_column('profile', 'updated_at')
    op.drop_column('profile', 'created_at')
