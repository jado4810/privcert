require 'rubygems'
require 'bundler'
Bundler.require

class Sinatra::Base
  configure do
    set :root, __dir__
    # Cache control for static resources: only works with rackup
    set :static_cache_control, :no_cache
  end

  before do
    # Cache control for dynamic resources: works with both rackup and passenger
    cache_control :no_store
  end
end

require_relative 'lib/app'
run App
