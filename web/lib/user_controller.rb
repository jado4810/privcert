class UserController < Sinatra::Base
  include ControllerHelper

  get '/user' do
    set_user(:or_login)
    view(:user)
  end

  def load
    return {
      list: Db::User.order(:created_at, :id).map{|user|
        {
          id: user.name.to_s_or_empty,
          updatable: (user.id != @user.id),
          deletable: (user.id != @user.id)
        }
      }
    }
  end

  get '/user/list.json' do
    set_user(:or_halt)

    begin
      json load()

    rescue ActiveRecord::ActiveRecordError => e
      halt 500, e.to_s
    end
  end

  post '/user' do
    set_user(:or_halt)

    id = params[:id].to_s_or_nil
    if id.nil?
      halt 400, 'No id'
    end

    passwd = params[:passwd]
    if passwd.nil? || passwd.empty?
      halt 400, 'No passwd'
    end

    begin
      user = Db::User.new

      user.name = id
      user.password = passwd
      user.password_confirmation = passwd

      unless user.save
        raise InternalError, 'Failed'
      end

      json load()

    rescue ActiveRecord::ActiveRecordError => e
      halt 400, e.to_s

    rescue ControllerError => e
      halt e.code, e.to_s
    end
  end

  post %r{/user/(\S+)} do |id|
    set_user(:or_halt)

    del = is_delete

    unless del
      passwd = params[:passwd]
      if passwd.nil? || passwd.empty?
        halt 400, 'No passwd'
      end
    end

    begin
      user = Db::User.find_by(name: id)
      if user.nil?
        raise NotFoundError, 'Unknown user'
      end

      if del
        if user.id == @user.id
          raise BadParamError, 'Not permitted'
        end

        user.invalid_flag = true

      else
        user.password = passwd
        user.password_confirmation = passwd
      end

      unless user.save
        raise InternalError, 'Failed'
      end

      json load()

    rescue ActiveRecord::ActiveRecordError => e
      halt 500, e.to_s

    rescue ControllerError => e
      halt e.code, e.to_s
    end
  end
end
