import Config

# We don't run a server during test. If one is required,
# you can enable the server option below.
config :docme, DocmeWeb.Endpoint,
  http: [ip: {127, 0, 0, 1}, port: 4002],
  secret_key_base: "oOfXG0NDu4Y4SwSLI/lc3rI4jHXSF+Czf8Sv/9JX8FHlaF/MELFtvSvEAaE1CIAV",
  server: false

# In test we don't send emails.
config :docme, DocMe.Mailer,
  adapter: Swoosh.Adapters.Test

# Print only warnings and errors during test
config :logger, level: :warn

# Initialize plugs at runtime for faster test compilation
config :phoenix, :plug_init_mode, :runtime
