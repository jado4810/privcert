class PasswdController < Sinatra::Base
  include ControllerHelper

  get '/passwd' do
    set_user(:or_login)
    view(:passwd)
  end

  post '/passwd' do
    set_user(:or_login)

    begin
      unless @user.authenticate(params[:passwd])
        @message = _('Invalid current password.', :passwd)
        raise BadParamError, 'Invalid passwd'
      end

      unless params[:new_passwd] == params[:new_passwd_verify]
        @message = _('New passwords unmatch.', :passwd)
        raise BadParamError, 'Unmatch passwds'
      end

      @user.password = params[:new_passwd]
      @user.password_confirmation = params[:new_passwd_verify]
      unless @user.save
        @message = _('Changing password failed.', :passwd)
        raise InternalError, 'Failed'
      end

      redirect to('/')

    rescue ControllerError
      view(:passwd)
    end
  end
end
