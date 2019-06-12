// ==UserScript==
// @name         从Steam探索队列移除被禁游戏
// @name:en      Steam Explore Skip Restricted Game
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在Steam显示“您所在的国家/地区不允许看到此内容”的时候将该游戏移出探索队列
// @description:en  Remove the game out of the explore queue when Steam displays "This content is not allowed in your country"
// @author       zhouhaoyu
// @supportURL   https://github.com/zhouhaoyu/snippets/issues
// @match        https://www.tampermonkey.net/installed.php?version=4.8.41&ext=dhdg&updated=true
// @grant        none
// @include      *://store.steampowered.com/agecheck/app/*
// ==/UserScript==

(function() {
    'use strict';

    const box = $("error_box");
    box.appendChild(document.createElement("br"));
    box.appendChild(document.createElement("br"));
    const button = document.createElement("a");
    button.innerHTML = "<span>移除此内容并继续探索队列</span>";
    button.className = "btnv6_green_white_innerfade btn_medium noicon";
    button.addEventListener("click", () => {
        button.innerHTML = "<span>请稍候，正在移除内容……</span>";
        $J.post("/app/7", { sessionid: g_sessionID, appid_to_clear_from_queue: parseInt(location.pathname.split('/')[3]) }, () => {
            button.innerHTML = "<span>正在查找新的队首……</span>";
            $J.get("https://store.steampowered.com/explore/", text => {
                button.innerHTML = "<span>马上跳转到新的队首……</span>";
                let apps, params;
                window.GStoreItemData = window.GStoreItemData || {};
                GStoreItemData.AddStoreItemDataSet = newApps => apps = newApps;
                GStoreItemData.AddNavParams = newParams => params = newParams;
                window.CDiscoveryQueue = function (_, q) {
                    if (q.length == 0) {
                        location = "https://store.steampowered.com/explore/";
                    } else {
                        const id = q[0];
                        location = "https://store.steampowered.com/app/" + id + "/" + apps.rgApps[id].name + "/?snr=" + params.discovery_queue;
                    }
                };
                const all = text.split('\n').map(t => t.trim());
                const idx = all.indexOf("GStoreItemData.AddStoreItemDataSet(");
                eval(all.slice(idx, idx + 10).join('\n'));
            });
        });
    });
    box.appendChild(button);
})();
