require 'sinatra/base'
require 'sinatra/config_file'
require 'active_record/base'
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

    # Application log
    if settings.respond_to?(:log_prefix)
      file = File.new("./log/#{settings.log_prefix}-app.log", 'a+')
      file.sync = true
      use Rack::CommonLogger, file
    end

    # Detect locales
    locale_files = Dir.glob('./locales/*.yml').sort
    I18n.load_path << locale_files
    priority = [:en, :'zh-CN']
    locale_files.each do |file|
      locale = file.sub(/^.+\//, '').sub(/\.yml$/, '').to_sym
      priority << locale unless priority.include?(locale)
    end
    I18n.config.available_locales = priority

    # Store session into cookie
    use Rack::Session::Cookie,
        secret: settings.session_secret,
        expire_after: settings.session_expire

    # Rack security options
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
