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

    # Extract settings
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

    # Application log
    if settings.respond_to?(:log_prefix) && settings.log_prefix.to_s_or_nil
      file = File.new("./log/#{settings.log_prefix.fullstrip}-app.log", 'a+')
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

    if settings.respond_to?(:session_expire) &&
       !settings.session_expire.nil? && settings.session_expire > 0
      session_expire = settings.session_expire
    else
      session_expire = nil
    end

    if settings.respond_to?(:session_secret) &&
       !settings.session_secret.nil? && !settings.session_secret.empty?
      session_secret = settings.session_secret
    else
      session_secret = 'PrivCertWebSecret'
    end

    # Store session into cookie
    use Rack::Session::Cookie,
        path: URL_PATH.nil? ? '/' : URL_PATH,
        expire_after: session_expire,
        secret: session_secret

    # Rack security options
    if session_expire.nil?
      use Rack::Protection::AuthenticityToken
    else
      use Rack::Protection::RemoteToken
    end
    use Rack::Protection::JsonCsrf
    use Rack::Protection::XSSHeader
    use Rack::Protection::FrameOptions
    use Rack::Protection::SessionHijacking
  end

  use LoginController
  use CertController
  use UserController
  use PasswdController
end
