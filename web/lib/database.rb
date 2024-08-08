module Db
  yaml = ERB.new(File.read('./config/database.yml')).result
  if YAML.respond_to?(:unsafe_load)
    ActiveRecord::Base.configurations = YAML.unsafe_load(yaml)
  else
    ActiveRecord::Base.configurations = YAML.load(yaml)
  end

  env = ENV['APP_ENV']&.to_sym || ENV['RACK_ENV']&.to_sym || :development
  ActiveRecord::Base.establish_connection(env)

  class User < ActiveRecord::Base
    has_secure_password

    default_scope { where(invalid_flag: false) }
  end
end
