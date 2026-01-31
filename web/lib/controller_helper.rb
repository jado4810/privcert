module ControllerHelper
  def self.included(obj)
    obj.before do
      request.script_name = App::URL_PATH unless App::URL_PATH.nil?

      # Detect locale from accept-language header
      default_locale = I18n.config.available_locales.first

      if request.env['HTTP_ACCEPT_LANGUAGE'].to_s_or_nil.nil?
        locale = default_locale
      else
        locales = I18n.config.available_locales.map(&:to_s).map{|lang|
          [lang.to_sym, lang.sub(/-.*/, '').to_sym]
        }.flatten.uniq

        locale = request.env['HTTP_ACCEPT_LANGUAGE'].split(',').map{|lang|
          lang.to_s_or_nil&.sub(/;.*$/, '')
        }.compact.map{|lang|
          [lang.to_sym, lang.sub(/-.*/, '').to_sym]
        }.flatten.uniq.find{|lang| locales.include?(lang)}
      end

      if I18n.config.available_locales.include?(locale)
        I18n.locale = locale
      else
        fallback_locale = I18n.config.available_locales.find{|lang|
          locale == lang.to_s.sub(/-.*/, '').to_sym
        }

        if I18n.config.available_locales.include?(fallback_locale)
          I18n.locale = fallback_locale
        else
          I18n.locale = default_locale
        end
      end
    end
  end

  def or_halt
    halt 403, 'Unauthorized'
  end

  def or_login
    redirect to('/login')
  end

  def set_user(fallback)
    unless session[:user_id]
      fallback.to_proc.call(self)
    end

    @user = Db::User.find_by(id: session[:user_id])
    if @user.nil?
      fallback.to_proc.call(self)
    end
  end

  PAGES = {
    login: {
      title: 'Login'
    },
    cert: {
      title: 'User Certs List',
      icon: 'list'
    },
    user: {
      title: 'Manage Accounts',
      icon: 'manage_accounts'
    },
    passwd: {
      title: 'Change Password',
      icon: 'password'
    },
    logout: {
      title: 'Logout',
      icon: 'logout'
    }
  }

  def view(page)
    @page = page
    @title = _(PAGES[page][:title], :title)
    erb page
  end

  def is_delete
    return params[:mode].to_s_or_nil == 'delete'
  end

  def link_icon(target)
    props = []
    if @page == target
      props << 'class="disabled"' << 'href="."' << 'tabindex="-1"'
    else
      if target == :cert
        props << %Q{href="."}
      else
        props << %Q{href="./#{target.to_s}"}
      end
      props << %Q{title="#{_(PAGES[target][:title], :title)}"}
    end
    props << %Q{data-icon="#{PAGES[target][:icon]}"}
    return '<a ' << props.join(' ') << '></a>'
  end

  def csrf_data
    return %Q{data-csrftoken="#{session[:csrf]}"}
  end

  def csrf_param
    return %Q{name="authenticity_token" value="#{session[:csrf]}"}
  end

  def _(msg, scope, key = nil)
    if key.nil?
      key = msg.gsub('%s', '').gsub(/[^\s_0-9A-Za-z]/, '').gsub(/\s+/, '_')
              .downcase.to_sym
    end
    I18n.t(key, scope: scope, default: msg)
  end

  def init_i18n_error_msg
    error_msgs =
      ServerError.subclasses.map{|klass| klass.new.to_s} << 'access error'
    defs = error_msgs.map{|msg|
      translation = _(msg, :error)
      "'#{msg}': '#{translation}'" if msg != translation
    }.compact.join(",\n        ")

    return "privcert.Util.i18n_error_msgs = {\n      " <<
           "  #{defs}\n      " <<
           '};'
  end
end

class NilClass
  def to_s_or_nil
    return nil
  end

  def to_s_or_empty
    return ''
  end
end

class String
  def fullstrip
    return self.sub(/^[\s　]+/, '').sub(/[\s　]+$/, '')
  end

  def to_s_or_nil
    s = self.fullstrip
    return s.empty? ? nil : s
  end

  def to_s_or_empty
    return self.fullstrip
  end
end
