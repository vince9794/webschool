/* ============================================================
   GREENHILL CMS — Schema loader
   Every page schema registers itself when imported.
   Keep this list in sync with the files in js/schema/.
   ============================================================ */

import './home.js';
import './about.js';
import './learning.js';
import './admissions.js';
import './campus.js';
import './journal.js';
import './contact.js';
import './portal.js';

export {
  getSchema, allSchemas, pageKeys,
  esc, tidy,
  readField, writeField, readList, writeList, applyContent
} from './core.js';
