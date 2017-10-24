import {asyncRouterMap, constantRouterMap} from '@/router'

/**
 * 通过meta.role判断是否与当前用户权限匹配
 * @param roles
 * @param route
 */
function hasPermission(menus, route) {
  /* if (route.meta && route.meta.role) {
    return roles.some(role => route.meta.role.indexOf(role) >= 0)
  } else {
    return false
  }*/
  if (route.path) {
    return menus.some(menu => menu.uri.length > 0 && route.path.indexOf(menu.uri) >= 0)
  } else {
    return true;
  }
}

/**
 * 递归过滤异步路由表，返回符合用户角色权限的路由表
 * @param asyncRouterMap
 * @param roles
 */
function filterAsyncRouter(asyncRouterMap, menus) {
  const accessedRouters = asyncRouterMap.filter(route => {
    if (hasPermission(menus, route)) {
      if (route.children && route.children.length) {
        route.children = filterAsyncRouter(route.children, menus)
      }
      return true
    }
    return false
  })
  return accessedRouters
}

function filterEmptyRouter(accessedRouters) {
  const filterRouter = accessedRouters.filter(route => {
    if (route.path) {
      return true;
    } else {
      if (route.children && route.children.length) {
        route.children = filterEmptyRouter(route.children);
        return true;
      } else {
        return false;
      }
    }
  })
  return filterRouter;
}

const permission = {
  state: {
    routers: constantRouterMap,
    addRouters: []
  },
  mutations: {
    SET_ROUTERS: (state, routers) => {
      state.addRouters = routers
      state.routers = constantRouterMap.concat(routers)
    }
  },
  actions: {
    GenerateRoutes({commit}, data) {
      const roles = data.roles;
      const menus = data.menus;
      return new Promise(resolve => {
        let accessedRouters
        if (roles.indexOf('admin') >= 0) {
          accessedRouters = asyncRouterMap
        } else {
          accessedRouters = filterAsyncRouter(asyncRouterMap, menus)
          accessedRouters = filterEmptyRouter(accessedRouters);
        }
        // console.log(accessedRouters);
        commit('SET_ROUTERS', accessedRouters)
        resolve()
      })
    }
  }
}

export default permission
