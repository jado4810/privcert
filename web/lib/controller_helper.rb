module ControllerHelper
  def self.included(obj)
    obj.before do
      request.script_name = App::URL_PATH unless App::URL_PATH.nil?

      langs = request.env['HTTP_ACCEPT_LANGUAGE']&.split(',')&.map{|lang|
        lang.sub(/;.*$/, '')
      }&.map{|lang|
        [lang.to_sym, lang.sub(/-.*/, '').to_sym]
      }&.flatten&.uniq

      locales = I18n.config.available_locales.map(&:to_s).map{|lang|
        [lang.to_sym, lang.sub(/-.*/, '').to_sym]
      }.flatten.uniq

      locale = langs&.find{|lang| locales.include?(lang)} || :ja
      begin
        I18n.locale = locale
      rescue
        I18n.locale = I18n.config.available_locales.find{|lang|
          locale == lang.to_s.sub(/-.*/, '').to_sym
        }
      end
    end
  end

  def or_halt
    halt 401, 'Unauthorized'
  end

  def or_login
    redirect to('/login')
  end

  def need_auth(fallback)
    unless session[:user_id]
      fallback.to_proc.call(self)
    end
  end

  PAGES = {
    login: {
      title: 'Login'
    },
    list: {
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

  def link_icon(target)
    props = []
    if @page == target
      props << 'class="disabled"' << 'href="#"'
    else
      props << %Q{href="./#{target.to_s}"}
    end
    props << %Q{title="#{_(PAGES[target][:title], :title)}"}
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
      key = msg.gsub(/[^\s_0-9A-Za-z]/, '').gsub(/\s+/, '_').downcase.to_sym
    end
    I18n.t(key, scope: scope, default: msg)
  end

  def init_i18n_js(scope, msgs)
    defs = msgs.map{|msg|
      "'" << msg << "': '" << _(msg, scope) << "'"
    }.join(",\n        ")
    <<-EOS
var _I18N_msgs = {
        #{defs}
      };
      function _(key) {
        return _I18N_msgs[key] || key;
      }
    EOS
  end
end
