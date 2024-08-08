class ListController < Sinatra::Base
  include ControllerHelper

  get '/' do
    need_auth(:or_login)
    view(:list)
  end

  get '/list.json' do
    need_auth(:or_halt)

    begin
      server = App::settings.server
      TCPSocket.open(server['host'], server['port']) do |s|
        s.print "PASSWD #{server['passwd']}\r\n"
        stat = s.gets&.sub(/\r?\n$/, '')
        raise UnexpectedEofError if stat.nil?
        ServerError.check(stat)

        s.print "LIST\r\n"
        stat = s.gets&.sub(/\r?\n$/, '')
        raise UnexpectedEofError if stat.nil?
        ServerError.check(stat, true)

        recs = []
        while true
          line = s.gets&.sub(/\r?\n$/, '')
          raise UnexpectedEofError if line.nil?
          break if line == 'EOF'

          cols = line.split(/\t/)
          recs << {
            name: cols[0],
            cname: cols[2],
            mail: cols[3],
            expire: cols[1],
            key: cols[4]
          }
        end

        data = {
          error: false,
          detail: recs
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
