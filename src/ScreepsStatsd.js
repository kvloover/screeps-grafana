/**
 * hopsoft\screeps-statsd
 *
 * Licensed under the MIT license
 * For full copyright and license information, please see the LICENSE file
 * 
 * @author     Bryan Conrad <bkconrad@gmail.com>
 * @copyright  2016 Bryan Conrad
 * @link       https://github.com/hopsoft/docker-graphite-statsd
 * @license    http://choosealicense.com/licenses/MIT  MIT License
 */

/**
 * SimpleClass documentation
 *
 * @since  0.1.0
 */
import fetch from 'node-fetch';
import StatsD from 'node-statsd';
import zlib from 'zlib';

export default class ScreepsStatsd {
  _host;
  _token;
  _shard;
  _graphite;
  _success;
  constructor(host, token, shard, graphite) {
    this._host = host;
    this._token = token;
    this._shard = shard;
    this._graphite = graphite;
    this._client = new StatsD({host: this._graphite});
  }
  run( string ) {
    setInterval(() => this.loop(), 15000);
  }

  loop() {
    this.getMemory();
  }

  async getMemory() {
    try {
      await this.signin();

      const response = await fetch(this._host + `/api/user/memory?path=stats&shard=${this._shard}`, {
        method: 'GET',
        headers: {
          "X-Token": this._token,
          'content-type': 'application/json',
        }
      });
      const data = await response.json();
      
      if (!data?.data || data.error) throw new Error(data?.error ?? 'No data');
      const unzippedData = JSON.parse(zlib.gunzipSync(Buffer.from(data.data.split('gz:')[1], 'base64')).toString())
      this.report(unzippedData);
    } catch (e) {
      console.error(e);
    }
  }

  report(data, prefix="") {
    if (prefix === '') console.log("Pushing to gauges -", new Date())
    for (const [k,v] of Object.entries(data)) {
      if (typeof v === 'object') {
        this.report(v, prefix+k+'.');
      } else {
        this._client.gauge(prefix+k, v);
      }
    }
  }
}
