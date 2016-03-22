import titles from './titles';

class MetaService {
  getPageTitle(path) {
    return titles[path] || 'NSW Synergy Health Gateway';
  }
}

export default new MetaService();
