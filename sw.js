const CACHE_NAME = 'almukhtar-real-offline-v1';

const BLOG_URL =
  'https://madasadzikir.blogspot.com/';

const OFFLINE_URL =
  'https://batukessel.github.io/madasapwa/offline.html';

// INSTALL
self.addEventListener(
  'install',
  function(event){

    self.skipWaiting();

    event.waitUntil(

      caches.open(CACHE_NAME)

        .then(function(cache){

          return cache.addAll([
            BLOG_URL,
            OFFLINE_URL
          ]);

        })

    );

  }
);

// ACTIVATE
self.addEventListener(
  'activate',
  function(event){

    event.waitUntil(

      Promise.all([

        self.clients.claim(),

        caches.keys()

          .then(function(keys){

            return Promise.all(

              keys.map(function(key){

                if(key !== CACHE_NAME){

                  return caches.delete(key);

                }

              })

            );

          })

      ])

    );

  }
);

// FETCH
self.addEventListener(
  'fetch',
  function(event){

    if(
      event.request.method !== 'GET'
    ){
      return;
    }

    event.respondWith(

      caches.match(event.request)

        .then(function(cacheResponse){

          // ADA CACHE
          if(cacheResponse){

            return cacheResponse;

          }

          // FETCH INTERNET
          return fetch(event.request)

            .then(function(networkResponse){

              // CLONE
              const responseClone =
                networkResponse.clone();

              // SIMPAN CACHE
              caches.open(CACHE_NAME)

                .then(function(cache){

                  cache.put(
                    event.request,
                    responseClone
                  );

                });

              return networkResponse;

            })

            .catch(function(){

              // COBA HOMEPAGE CACHE
              return caches.match(BLOG_URL)

                .then(function(home){

                  if(home){
                    return home;
                  }

                  // FALLBACK OFFLINE
                  return caches.match(
                    OFFLINE_URL
                  );

                });

            });

        })

    );

  }
);
