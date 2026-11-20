"""Regression check for the plot history uniqueness migration."""
import importlib.util
from pathlib import Path
import unittest
from unittest.mock import patch


MIGRATION_PATH = Path("/app/alembic/versions/c1f8a9234b01_add_plot_label_and_plot_history_unique.py")
spec = importlib.util.spec_from_file_location(
    "plot_history_migration", MIGRATION_PATH
)
migration = importlib.util.module_from_spec(spec)
spec.loader.exec_module(migration)


class PlotHistoryMigrationTests(unittest.TestCase):
    @patch.object(migration.op, "create_unique_constraint")
    @patch.object(migration.op, "execute")
    @patch.object(migration.op, "add_column")
    def test_upgrade_removes_duplicates_before_adding_constraint(
        self, add_column, execute, create_unique_constraint
    ):
        migration.upgrade()

        add_column.assert_called_once()
        execute.assert_called_once()
        create_unique_constraint.assert_called_once_with(
            "uq_plot_history_plot_id_year",
            "plot_history",
            ["plot_id", "year"],
        )

        sql = str(execute.call_args.args[0])
        self.assertIn("PARTITION BY plot_id, year", sql)
        self.assertIn("ORDER BY id DESC", sql)
        self.assertIn("WHERE duplicate_rank > 1", sql)

        first_call = add_column.call_args
        self.assertEqual(first_call.args[0], "plots")


if __name__ == "__main__":
    unittest.main()
