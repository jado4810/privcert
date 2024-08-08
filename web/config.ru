require 'rubygems'
require 'bundler'
Bundler.require

class Sinatra::Base
  configure do
    set :root, __dir__
  end
end

require_relative 'lib/app'
run App
