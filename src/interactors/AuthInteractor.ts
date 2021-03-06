import { DataStore } from '../interfaces/interfaces';
import { User } from '../models/models';
import * as bcrypt from 'bcrypt';

const SALT_ROUNDS = 10;

export class AuthInteractor {
  /**
   * Inserts new Users
   *
   * @static
   * @param {DataStore} dataStore
   * @param {string} username
   * @param {string} password
   * @returns
   * @memberof AuthInteractor
   */
  public static async register(
    dataStore: DataStore,
    username: string,
    password: string,
  ) {
    try {
      const exists = await dataStore.findUser(username);
      if (exists) {
        return Promise.reject('Username is already in use');
      }
      password = await bcrypt.hash(password, SALT_ROUNDS);
      const user = await dataStore.addUser(username, password);
      delete user.password;
      return user;
    } catch (e) {
      return Promise.reject(`Problem registering. Error: ${e}`);
    }
  }

  /**
   * Loads User record with username and password
   *
   * @static
   * @param {DataStore} dataStore
   * @param {string} username
   * @param {string} password
   * @returns {Promise<User>}
   * @memberof AuthInteractor
   */
  public static async login(
    dataStore: DataStore,
    username: string,
    password: string,
  ): Promise<User> {
    try {
      let id: string;
      try {
        id = await dataStore.findUser(username);
      } catch (e) {
        return Promise.reject('Invalid username');
      }
      if (!id) {
        return Promise.reject('Invalid username');
      }
      const user = await dataStore.fetchUser(id);

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return Promise.reject('Password is incorrect');
      }
      await dataStore.updateLastSignOn(user.id);
      delete user.password;
      return user;
    } catch (e) {
      return Promise.reject(`Problem logining in. Error: ${e}`);
    }
  }
}
