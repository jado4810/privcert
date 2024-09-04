require 'rubygems'
require 'bundler'
Bundler.require

class Sinatra::Base
  configure do
    set :root, __dir__
    set :static_cache_control, :no_cache
  end

  before do
    cache_control :no_store
  end
end

require_relative 'lib/app'
run App
