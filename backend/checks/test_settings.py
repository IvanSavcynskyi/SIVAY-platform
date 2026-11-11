"""Deployment checks that never connect to a database or load pytest fixtures."""
import ssl
import unittest

from app.core.config import Settings


class DatabaseSettingsTests(unittest.TestCase):
    def settings(self, **values):
        return Settings(_env_file=None, POSTGRES_USER="sivay",
                        POSTGRES_PASSWORD="p@ss/word%with:characters",
                        SECRET_KEY="test-only", **values)

    def test_password_is_preserved_as_a_url_component(self):
        url = self.settings().ASYNC_DATABASE_URL
        self.assertEqual(url.password, "p@ss/word%with:characters")
        self.assertEqual(url.host, "localhost")

    def test_local_database_can_disable_tls(self):
        self.assertIs(self.settings(POSTGRES_SSL_MODE="disable").DATABASE_CONNECT_ARGS["ssl"], False)

    def test_verify_full_checks_certificate_and_hostname(self):
        context = self.settings(POSTGRES_SSL_MODE="verify-full").DATABASE_CONNECT_ARGS["ssl"]
        self.assertTrue(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_REQUIRED)

    def test_require_encrypts_without_certificate_verification(self):
        context = self.settings(POSTGRES_SSL_MODE="require").DATABASE_CONNECT_ARGS["ssl"]
        self.assertFalse(context.check_hostname)
        self.assertEqual(context.verify_mode, ssl.CERT_NONE)

    def test_missing_ca_does_not_fall_back_to_unverified_tls(self):
        with self.assertRaises(FileNotFoundError):
            self.settings(POSTGRES_SSL_MODE="verify-full",
                          POSTGRES_SSL_ROOT_CERT="/nonexistent/sivay-ca.pem").DATABASE_CONNECT_ARGS

    def test_sql_parameter_logging_is_disabled_by_default(self):
        self.assertFalse(self.settings().SQL_ECHO)


if __name__ == "__main__":
    unittest.main()
