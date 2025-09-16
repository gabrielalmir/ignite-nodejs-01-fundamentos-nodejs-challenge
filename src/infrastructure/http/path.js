export class Path {
  parse(path) {
    return path.split("/").filter(Boolean);
  }

  params(endpoint, target) {
    const endpointParts = this.parse(endpoint);
    const targetParts = this.parse(target);

    if (endpointParts.length !== targetParts.length) {
      return {};
    }

    const params = {};

    for (let i = 0; i < endpointParts.length; i++) {
      if (endpointParts[i].startsWith(":")) {
        const paramName = endpointParts[i].substring(1);
        params[paramName] = targetParts[i];
      } else if (endpointParts[i] !== targetParts[i]) {
        return {};
      }
    }

    return params;
  }

  isMatch(endpoint, target) {
    const endpointParts = this.parse(endpoint);
    const targetParts = this.parse(target);

    if (endpointParts.length !== targetParts.length) {
      return false;
    }

    for (let i = 0; i < endpointParts.length; i++) {
      if (
        !endpointParts[i].startsWith(":") &&
        endpointParts[i] !== targetParts[i]
      ) {
        return false;
      }
    }

    return true;
  }

  queryParams(url) {
    const [_, queryString] = url.split("?");
    if (!queryString) {
      return {};
    }

    return queryString.split("&").reduce((acc, pair) => {
      const [key, value] = pair.split("=");
      acc[decodeURIComponent(key)] = decodeURIComponent(value || "");
      return acc;
    }
    , {});
  }
}
