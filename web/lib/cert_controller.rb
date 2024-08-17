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

  get %r{/cert/([0-9A-F]+)} do |key|
    server = App::settings.server

    TCPSocket.open(server['host'], server['port']) do |s|
      begin
        auth(s, server['passwd'])

        target = get_list(s).find{|elem| elem[:key] == key}
        if target.nil?
          halt 404, 'Not found'
        end

        stat = sendrecv(s, "GET #{target[:name]}")
        ServerError.check(stat, true)

        cert = Base64.decode64(get_data(s).join(''))

        content_type 'application/x-pkcs12'
        attachment "#{target[:name]}.pfx"
        cert

      rescue ServerError => e
        halt 500, "Server error: #{e.to_s}"

      ensure
        close(s)
      end
    end
  end

  post '/cert' do
    need_auth(:or_halt)

    case params[:mode].to_s_or_nil
    when 'revoke'
      mode = :revoke
    when nil
      mode = :make
    else
      halt 400, 'Unknown mode'
    end

    name = params[:name].to_s_or_nil
    if name.nil?
      halt 400, 'No name'
    end

    server = App::settings.server

    TCPSocket.open(server['host'], server['port']) do |s|
      begin
        auth(s, server['passwd'])

        case mode
        when :make
          cname = params[:cname].to_s_or_nil
          unless cname.nil?
            stat = sendrecv(s, "SETCN #{cname}")
            ServerError.check(stat, false)
          end

          mail = params[:mail].to_s_or_nil
          unless mail.nil?
            stat = sendrecv(s, "SETMAIL #{mail}")
            ServerError.check(stat, false)
          end

          stat = sendrecv(s, "MAKE #{name}")

        when :revoke
          stat = sendrecv(s, "REVOKE #{name}")

        else
          halt 500, 'Illegal mode'
        end

        ServerError.check(stat, false)

        data = {
          error: false,
          detail: get_list(s)
        }
        json data

      rescue ServerError => e
        data = {
          error: true,
          detail: e.to_s
        }
        json data

      ensure
        close(s)
      end
    end
  end
end
