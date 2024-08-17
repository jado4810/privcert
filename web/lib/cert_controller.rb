class CertController < Sinatra::Base
  include ControllerHelper

  get '/' do
    need_auth(:or_login)
    view(:cert)
  end

  get '/cert/list.json' do
    need_auth(:or_halt)

    begin
      server = App::settings.server
      TCPSocket.open(server['host'], server['port']) do |s|
        auth(s, server['passwd'])

        data = {
          error: false,
          detail: get_list(s)
        }
        json data
      end
    rescue ServerError => e
      data = {
        error: true,
        detail: e.to_s
      }
      json data
    end
  end
end
