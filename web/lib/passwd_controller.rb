class PasswdController < Sinatra::Base
  include ControllerHelper

  get '/passwd' do
    need_auth(:or_login)
    view(:passwd)
  end

  post '/passwd' do
    user = get_user(:or_login)

    unless user.authenticate(params[:passwd])
      @message = _('Invalid current password.', :passwd)
      return view(:passwd)
    end

    unless params[:new_passwd] == params[:new_passwd_verify]
      @message = _('New passwords unmatch.', :passwd)
      return view(:passwd)
    end

    user.password = params[:new_passwd]
    user.password_confirmation = params[:new_passwd_verify]
    unless user.save
      @message = _('Changing password failed.', :passwd)
      return view(:passwd)
    end

    redirect to('/')
  end
end
