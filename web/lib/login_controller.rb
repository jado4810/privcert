class LoginController < Sinatra::Base
  include ControllerHelper

  get '/login' do
    @message = nil
    view(:login)
  end

  post '/login' do
    user = Db::User.find_by(name: params[:user])
    if user&.authenticate(params[:passwd])
      session[:user_id] = user.id
      redirect to('/')
    else
      @message = _('Login failed.', :login)
      view(:login)
    end
  end

  get '/logout' do
    need_auth(:or_login)
    session.clear
    redirect to('/login')
  end
end
