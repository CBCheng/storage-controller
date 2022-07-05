/* eslint-disable no-console */
class StorageController {
  constructor(config) {
    const { env = null, type = null, name = null } = config
    this.env = env
    this.name = name // 欄位名稱
    this.storageName = type // 儲存位置
    this.type = ['sessionStorage', 'localStorage'].includes(type) ? window[type] : null
  }

  _utf8ToB64(str) {
    if (this.env === 'production') return window.btoa(encodeURIComponent(str))
    return str
  }

  _b64ToUtf8(str) {
    if (this.env === 'production') return decodeURIComponent(window.atob(str))
    return str
  }

  _hasStorage() {
    return this.type.getItem(this.name)
      ? JSON.parse(this._b64ToUtf8(this.type.getItem(this.name)))
      : false
  }

  _initStorage() {
    const hasStorage = this._hasStorage()
    if (hasStorage) return hasStorage

    this.type.setItem(this.name, this._utf8ToB64(JSON.stringify({ init: true })))
    return { init: true }
  }

  _checker() {
    const arr = [this.env, this.name, this.storageName, this.type]
    if (!arr.includes(null)) return true

    if (!this.env) console.error('Undefined env.')
    else if (!this.name) console.error('Undefined name.')
    else if (!this.storageName) console.error('Undefined type.')
    else if (!this.type) console.error('Error type.')

    return false
  }

  // ========= 以上為私有方法 ==========

  get(key) {
    if (!this._checker()) return undefined

    const storage = this._initStorage()

    // 查詢storage物件本身
    if (this.name === key) return storage

    // 查詢storage物件裡的欄位
    const field = storage[key]
    if (field) return field

    console.error(`Can't find ${this.name} in ${this.storageName}`)
    return undefined
  }

  set(key, value) {
    if (!this._checker()) return

    let storage = this._initStorage()

    // 對storage物件本身做新增
    if (this.name === key) storage = value
    // 對storage物件裡的屬性做新增
    else storage[key] = value

    this.type.setItem(this.name, this._utf8ToB64(JSON.stringify(storage)))
  }

  delete(key) {
    if (!this._checker()) return

    if (!this.name) {
      // eslint-disable-next-line no-console
      console.error(`Can't find ${this.name} in ${this.storageName}`)
      return
    }

    // 刪除storage物件本身
    if (this.name === key) {
      this.type.removeItem(this.name)
      return
    }

    // 刪除storage物件裡的屬性
    const storage = this._initStorage()
    if (storage[key]) {
      delete storage[key]
      this.type.setItem(this.name, this._utf8ToB64(JSON.stringify(storage)))
      return
    }

    console.error(`Can't find ${this.name} in ${this.storageName}`)
  }
}

export default StorageController
