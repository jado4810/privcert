class ServerError < StandardError
  attr_reader :code

  def initialize(code, msg)
    @code = code
    super(msg)
  end

  def self.check(res, have_data = nil)
    case res
    when /^0/
      raise NoDataError unless have_data.nil? || have_data == false
      return false
    when /^1/
      raise UnexpectedDataError unless have_data.nil? || have_data == true
      return true
    when /^20[45]/
      raise BadPasswordError
    when /^211/
      raise CertExistsError
    when /^2[24]1/
      raise CertNotFoundError
    when /^21[234]/
      raise CertCreateError
    when /^242/
      raise CertRevokeError
    else
      raise UnknownServerError
    end
  end
end

class BadPasswordError < ServerError
  def initialize
    super(500, 'bad server password')
  end
end

class CertExistsError < ServerError
  def initialize
    super(400, 'specified cert already exists')
  end
end

class CertNotFoundError < ServerError
  def initialize
    super(404, 'specified cert not found')
  end
end

class CertCreateError < ServerError
  def initialize
    super(500, 'error on creating cert')
  end
end

class CertRevokeError < ServerError
  def initialize
    super(500, 'error on revoking cert')
  end
end

class UnknownServerError < ServerError
  def initialize
    super(500, 'unknown server error')
  end
end

class NoDataError < ServerError
  def initialize
    super(500, 'no data in server response')
  end
end

class UnexpectedDataError < ServerError
  def initialize
    super(500, 'unexpected data in server response')
  end
end

class UnexpectedEofError < ServerError
  def initialize
    super(500, 'unexpected eof in server response')
  end
end

class CommunicationError < ServerError
  def initialize
    super(500, 'error on server communication')
  end
end

class ControllerError < StandardError
  attr_reader :code

  def initialize(code, msg)
    @code = code
    super(msg)
  end
end

class BadParamError < ControllerError
  def initialize(msg)
    super(400, msg)
  end
end

class NotFoundError < ControllerError
  def initialize(msg)
    super(404, msg)
  end
end

class InternalError < ControllerError
  def initialize(msg)
    super(500, msg)
  end
end
