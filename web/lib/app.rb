require 'sinatra/base'
require 'sinatra/config_file'
require 'active_record/base'
require 'active_support/core_ext/date/calculations'
require 'socket'
require_relative 'exception'
require_relative 'database'
require_relative 'controller_helper'
require_relative 'login_controller'
require_relative 'cert_controller'
require_relative 'user_controller'
require_relative 'passwd_controller'

class App < Sinatra::Base
  configure do
    register Sinatra::ConfigFile
    config_file './config/settings.yml'

    if settings.respond_to?(:log_prefix)
      file = File.new("./log/#{settings.log_prefix}-app.log", 'a+')
      file.sync = true
      use Rack::CommonLogger, file
    end

    I18n.load_path << Dir.glob('./locales/*.yml')
    I18n.config.available_locales = [:en, :ja, :'zh-CN', :'zh-TW', :ko, :de]

    use Rack::Session::Cookie,
        secret: settings.session_secret,
        expire_after: settings.session_expire

    use Rack::Protection::AuthenticityToken
    use Rack::Protection::JsonCsrf
    use Rack::Protection::XSSHeader
    use Rack::Protection::FrameOptions
    use Rack::Protection::SessionHijacking
  end

  if settings.respond_to?(:url_path)
    path = settings.url_path.match(/^\//) ? '' : '/'
    path << settings.url_path.sub(/\/$/, '')
    if path.empty?
      URL_PATH = nil
    else
      URL_PATH = path
    end
  else
    URL_PATH = nil
  end

  use LoginController
  use CertController
  use UserController
  use PasswdController
end
