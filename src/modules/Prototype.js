class Prototype {

  constructor() {
    // Error
    Error.prototype.name = ''
  }

}

module.exports = new Prototype()
