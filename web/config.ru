require 'rubygems'
require 'bundler'
Bundler.require

class Sinatra::Base
  configure do
    set :root, __dir__
  end

  # Only works with rackup
  configure :development do
    # Cache control for static resources
    set :static_cache_control, :no_cache
    # Disable host authorization
    set :host_authorization, { permitted_hosts: [] }
  end

  before do
    # Cache control for dynamic resources: works with both rackup and passenger
    cache_control :no_store
  end
end

require_relative 'lib/app'
run App
