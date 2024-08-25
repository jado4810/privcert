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
        deletable: (user.id != curr_user.id)
      }
    }
  end

  get '/user/list.json' do
    user = get_user(:or_halt)

    begin
      data = {
        error: false,
        detail: get_list(user)
      }
      json data
    rescue
      data = {
        error: true,
        detail: 'db error'
      }
      json data
    end
  end
end
