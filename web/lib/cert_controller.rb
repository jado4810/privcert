class CertController < Sinatra::Base
  include ControllerHelper

  get '/' do
    set_user(:or_login)
    view(:cert)
  end

  def send(s, cmd)
    s.sync = true
    s.write("#{cmd}\r\n")
  end

  def recv(s)
    return s.readline(chomp: true)
  rescue EOFError
    raise ServerError::UnexpectedEofError
  end

  def sendrecv(s, cmd)
    send(s, cmd)
    return recv(s)
  end

  def auth(s, passwd)
    stat = sendrecv(s, "PASSWD #{passwd}")
    ServerError.check(stat, false)
  end

  def get_data(s)
    data = []
    while true
      line = recv(s)
      case line
      when nil
        raise UnexpectedEofError
      when 'EOF'
        return data
      else
        data << line
      end
    end
  end

  def load(s)
    stat = sendrecv(s, 'LIST')
    if ServerError.check(stat)
      return {
        list: get_data(s).map{|elem|
          cols = elem.split(/\t/)
          {
            id: cols[0].to_s_or_empty,
            cn: cols[2].to_s_or_empty,
            mail: cols[3].to_s_or_empty,
            expire: cols[1].to_s_or_empty,
            key: cols[4].to_s_or_empty
          }
        }
      }
    else
      return {
        list: []
      }
    end
  end

  def close(s)
    stat = sendrecv(s, 'BYE')
    ServerError.check(stat, false)
  end

  get '/cert/list.json' do
    set_user(:or_halt)

    server = App::settings.server

    begin
      TCPSocket.open(server['host'], server['port']) do |s|
        begin
          auth(s, server['passwd'])
          json load(s)

        ensure
          close(s)
        end
      end

    rescue SocketError, SystemCallError => e
      halt 500, e.to_s

    rescue ServerError => e
      halt e.code, e.to_s
    end
  end

  get %r{/cert/([0-9A-F]+)} do |key|
    server = App::settings.server

    begin
      TCPSocket.open(server['host'], server['port']) do |s|
        begin
          auth(s, server['passwd'])

          target = load(s)[:list].find{|elem| elem[:key] == key}
          if target.nil?
            raise NotFoundError, 'Not found'
          end

          stat = sendrecv(s, "GET #{target[:id]}")
          ServerError.check(stat, true)

          cert = Base64.decode64(get_data(s).join(''))

          content_type 'application/x-pkcs12'
          attachment "#{target[:id]}.pfx"
          cert

        ensure
          close(s)
        end
      end

    rescue SocketError, SystemCallError => e
      halt 500, e.to_s

    rescue ServerError, ControllerError => e
      halt e.code, e.to_s
    end
  end

  post '/cert' do
    set_user(:or_halt)

    id = params[:id].to_s_or_nil
    if id.nil?
      halt 400, 'No id'
    end

    cn = params[:cn].to_s_or_nil
    mail = params[:mail].to_s_or_nil

    server = App::settings.server

    begin
      TCPSocket.open(server['host'], server['port']) do |s|
        begin
          auth(s, server['passwd'])

          unless cn.nil?
            stat = sendrecv(s, "SETCN #{cn}")
            ServerError.check(stat, false)
          end

          unless mail.nil?
            stat = sendrecv(s, "SETMAIL #{mail}")
            ServerError.check(stat, false)
          end

          stat = sendrecv(s, "MAKE #{id}")
          ServerError.check(stat, false)

          json load(s)

        ensure
          close(s)
        end
      end

    rescue SocketError, SystemCallError => e
      halt 500, e.to_s

    rescue ServerError => e
      halt e.code, e.to_s
    end
  end

  post %r{/cert/(\S+)} do |id|
    set_user(:or_halt)

    unless is_delete
      halt 200, 'Unknown mode'
    end

    server = App::settings.server

    begin
      TCPSocket.open(server['host'], server['port']) do |s|
        begin
          auth(s, server['passwd'])

          stat = sendrecv(s, "REVOKE #{id}")
          ServerError.check(stat, false)

          json load(s)

        ensure
          close(s)
        end
      end

    rescue SocketError, SystemCallError => e
      halt 500, e.to_s

    rescue ServerError => e
      halt e.code, e.to_s
    end
  end
end
