class ServerError < StandardError
  def self.check(res, have_data = nil)
    case res
    when /^0/
      raise NoDataError unless have_data.nil? || have_data == false
      return false
    when /^1/
      raise UnexpectedDataError unless have_data.nil? || have_data == true
      return true
    when /^20[45]/
      raise BadPasswordError;
    when /^211/
      raise CertExistsError;
    when /^2[24]1/
      raise CertNotFoundError;
    when /^21[234]/
      raise CertCreateError;
    when /^242/
      raise CertRevokeError;
    else
      raise UnknownServerError;
    end
  end
end

class BadPasswordError < ServerError
  def initialize
    super('bad server password');
  end
end

class CertExistsError < ServerError
  def initialize
    super('specified cert already exists')
  end
end

class CertNotFoundError < ServerError
  def initialize
    super('specified cert not found')
  end
end

class CertCreateError < ServerError
  def initialize
    super('error on creating cert')
  end
end

class CertRevokeError < ServerError
  def initialize
    super('error on revoking cert')
  end
end

class UnknownServerError < ServerError
  def initialize
    super('unknown server error')
  end
end

class NoDataError < ServerError
  def initialize
    super('no data in server response')
  end
end

class UnexpectedDataError < ServerError
  def initialize
    super('unexpected data in server response')
  end
end

class UnexpectedEofError < ServerError
  def initialize
    super('unexpected eof in server response')
  end
end
