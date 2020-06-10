const swaggerUi = require("swagger-ui-express");
const swaggerJSDoc = require("swagger-jsdoc");
const config = require("../config");
const swaggerConfig = config.swaggerConfig;

function setSwagger(app) {
  const options = {
    definition: {
      openapi: swaggerConfig.openapi,
      info: {
        title: swaggerConfig.title,
        version: swaggerConfig.version,
        description: swaggerConfig.description
      },
      servers: [
        {
          url: swaggerConfig.url
        }
      ]
    },
    apis: swaggerConfig.apis
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.get("/api-docs.json", (req, res) => {
    res.setHeader("Content-Type", "application/json");
    res.send(swaggerSpec);
  });

  app.use(
    swaggerConfig.routerPath,
    swaggerUi.serve,
    swaggerUi.setup(swaggerSpec)
  );
}

module.exports = setSwagger;
