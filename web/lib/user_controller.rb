class UserController < Sinatra::Base
  include ControllerHelper

  get '/user' do
    need_auth(:or_login)
    view(:user)
  end

  def get_list(curr_user)
    return Db::User.order(:created_at, :id).map{|user|
      {
        name: user.name.to_s_or_empty,
        mine: (user.id == curr_user.id)
      }
    }
  end

  get '/user/list.json' do
    curr_user = get_user(:or_halt)

    begin
      data = {
        error: false,
        detail: get_list(curr_user)
      }
      json data

    rescue ActiveRecord::ActiveRecordError => e
      data = {
        error: true,
        detail: e.to_s
      }
      json data
    end
  end

  post '/user' do
    curr_user = get_user(:or_halt)

    case params[:mode].to_s_or_nil
    when 'create'
      mode = :create
    when 'update'
      mode = :update
    when 'delete'
      mode = :delete
    else
      halt 400, 'Unknown mode'
    end

    name = params[:name].to_s_or_nil
    if name.nil?
      halt 400, 'No name'
    end

    begin
      if mode == :create
        user = Db::User.new

        user.name = name
        user.password = params[:passwd]
        user.password_confirmation = params[:passwd]

      else
        user = Db::User.find_by(name: name)
        if user.nil?
          halt 400, 'Unknown user'
        end

        case mode
        when :update
          user.password = params[:passwd]
          user.password_confirmation = params[:passwd]

        when :delete
          if user.id == curr_user.id
            halt 400, 'Not permitted'
          end

          user.invalid_flag = true

        else
          halt 500, 'Illegal mode'
        end
      end

      unless user.save
        halt 500, 'Failed'
      end

      data = {
        error: false,
        detail: get_list(curr_user)
      }
      json data

    rescue ActiveRecord::ActiveRecordError => e
      data = {
        error: true,
        detail: e.to_s
      }
      json data
    end
  end
end
