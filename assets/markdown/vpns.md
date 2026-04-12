# ClawCloud Run 部署 V2Ray (VLESS+WS) 实践指南

## 部署步骤

1. 准备配置文件 (ConfigMap)

   在 ClawCloud 控制台的 Advanced Configuration 中，点击 Configmaps 添加以下内容：

   - 挂载路径: `/etc/v2ray/config.json`
   - 内容:
   - uuid可以在[这里](https://www.uuidgenerator.net/version4)获取
  
   ```json
   {
     "inbounds": [{
       "port": 8080,
       "protocol": "vless",
       "settings": {
         "clients": [{ "id": "你的-UUID-字符串" }],
         "decryption": "none"
       },
       "streamSettings": {
         "network": "ws",
         "wsSettings": { "path": "/path" }
       }
     }],
     "outbounds": [{ "protocol": "freedom" }]
   }
   ```

2. 容器镜像配置

   镜像 (Image): 推荐使用 `v2fly/v2fly-core` 或 `teddysun/v2ray`。
  
   Usage选Fixed，CPU选择0.1，Memory选256M。
  
   Network设置8080端口并启用。
  
3. 高级配置 (Advanced)

   Command: 建议留空，使用镜像默认启动命令。

   Arguments: 建议留空。若需手动指定，可参考 `run -config /etc/v2ray/config.json`。

   Configmaps：添加你准备的配置文件。

   点击部署等待完成即可（可能会拉取镜像失败，多试几次。）。

4. 客户端配置 (Clash 示例)

   在 Clash 配置文件中添加代理：

   ```yaml
   proxies:
     - name: "name"
       type: vless
       server: 你的应用域名.clawcloudrun.com
       port: 443
       uuid: 你的-UUID-字符串
       tls: true
       network: ws
       servername: 你的应用域名.clawcloudrun.com
       ws-opts:
         path: /path
   proxy-groups:
     - name: 🚀 节点选择
       type: select
       proxies:
         - "name" # 确保这里和上面的 name 完全一致
         - DIRECT

   rules:
     - GEOIP,CN,DIRECT
     - MATCH,🚀 节点选择
   ```

## ⚠️ 关键注意事项 (踩坑总结)

路径匹配: 服务端 JSON 里的 path 必须与客户端 YAML 里的 path 严格一致（例如：/path）。

健康检查与 Pending: 容器启动初期显示 Pending 是正常的，因为 V2Ray 在没有合法 WS 请求时可能不会返回 200 OK，导致平台健康检查判定较慢。
