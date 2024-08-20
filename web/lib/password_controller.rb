class PasswordController < Sinatra::Base
  include ControllerHelper

  get '/passwd' do
    need_auth(:or_login)
    view(:passwd)
  end

  post '/passwd' do
    user = get_user(:or_login)

    unless user.authenticate(params[:password])
      @message = _('Invalid current password.', :passwd)
      return view(:passwd)
    end

    unless params[:new_password] == params[:new_password_verify]
      @message = _('New passwords unmatch.', :passwd)
      return view(:passwd)
    end

    user.password = params[:new_password]
    user.password_confirmation = params[:new_password_verify]
    unless user.save
      @message = _('Changing password failed.', :passwd)
      return view(:passwd)
    end

    redirect to('/')
  end
end
