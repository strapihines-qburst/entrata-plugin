/**
 * `deepPopulate` middleware
 */

import type { Core } from '@strapi/strapi';
import { UID } from '@strapi/types';
import { contentTypes } from '@strapi/utils';
import pluralize from 'pluralize';


interface Options {
  /**
   * Fields to select when populating relations
   */
  relationalFields?: string[];
}

const { CREATED_BY_ATTRIBUTE, UPDATED_BY_ATTRIBUTE } = contentTypes.constants;

const extractPathSegment = (url: string) => url.match(/\/([^/?]+)(?:\?|$)/)?.[1] || '';

const getDeepPopulate = (uid: UID.Schema, opts: Options = {}, depth: number = 0, maxDepth: { value: number } = { value: 0 }, visited: Set<string> = new Set(), maxDepthLimit: number = 5) => {
  // Update max depth if current depth is greater
  if (depth > maxDepth.value) {
    maxDepth.value = depth;
  }
  
  // Stop recursion if max depth is reached - check BEFORE processing
  if (depth >= maxDepthLimit) {
    strapi.log.warn(`Max depth reached for ${uid} at depth ${depth}`);
    return {};
  }

  // Check for circular references
  const uidKey = String(uid);
  if (visited.has(uidKey)) {
    strapi.log.warn(`Circular reference detected for ${uid} at depth ${depth}`);
    return {};
  }
  
  const model = strapi.getModel(uid);
  if (!model) {
    return {};
  }
  
  const attributes = Object.entries(model?.attributes || {});
  
  // Create a new visited set for this branch
  const newVisited = new Set(visited);
  newVisited.add(uidKey);

  return attributes.reduce((acc: any, [attributeName, attribute]) => {
    const attr = attribute as any;
    switch (attr.type) {
      case 'relation': {
        const isMorphRelation = attr.relation.toLowerCase().startsWith('morph');
        if (isMorphRelation) {
          break;
        }

        // Ignore not visible fields other than createdBy and updatedBy
        const isVisible = contentTypes.isVisibleAttribute(model, attributeName);
        const isCreatorField = [CREATED_BY_ATTRIBUTE, UPDATED_BY_ATTRIBUTE].includes(attributeName);
        
        if (isVisible) {
          // Get the target entity UID for the relation
          const targetUID = attr.target;
          if (targetUID) {
            // Recursively populate the related entity with incremented depth
            const populate = getDeepPopulate(targetUID as UID.Schema, opts, depth + 1, maxDepth, newVisited, maxDepthLimit);
            // Only add populate if it's not empty (to avoid breaking queries)
            if (Object.keys(populate).length > 0) {
              acc[attributeName] = { populate };
            } else {
              // At max depth, just populate basic fields
              acc[attributeName] = true;
            }
          } else {
            // Fallback to basic population if target UID is not available
            acc[attributeName] = true;
          }
        }

        break;
      }

      case 'media': {
        // acc[attributeName] = { populate: "*" };
        acc[attributeName] = { fields: ['id','name','url','alternativeText'] }; 
        break;
      }

      case 'component': {
        const populate = getDeepPopulate(attr.component, opts, depth + 1, maxDepth, newVisited, maxDepthLimit);
        // Only add populate if it's not empty
        if (Object.keys(populate).length > 0) {
          acc[attributeName] = { populate };
        } else {
          // At max depth, just populate basic fields
          acc[attributeName] = true;
        }
        break;
      }

      case 'dynamiczone': {
        // Use fragments to populate the dynamic zone components
        const populatedComponents = (attr.components || []).reduce(
          (acc: any, componentUID: UID.Component) => {
            const populate = getDeepPopulate(componentUID, opts, depth + 1, maxDepth, newVisited, maxDepthLimit);
            // Only add populate if it's not empty
            if (Object.keys(populate).length > 0) {
              acc[componentUID] = { populate };
            } else {
              acc[componentUID] = true;
            }
            return acc;
          },
          {}
        );

        acc[attributeName] = { on: populatedComponents };
        break;
      }
      default:
        break;
    }

    return acc;
  }, {});
};

export default (config, { strapi }: { strapi: Core.Strapi }) => {
  return async (ctx, next) => {
    if (ctx.request.url.startsWith('/api/') && ctx.request.method === 'GET' && !ctx.query.populate && !ctx.request.url.includes('/api/seo')
    ) {
      strapi.log.info('Using custom Dynamic-Zone population Middleware...');

      const contentType = extractPathSegment(ctx.request.url);
      const singular = pluralize.singular(contentType)
      const uid = `api::${singular}.${singular}`;

  
      try {
        // Allow max depth to be configured via query parameter (default: 5)
        const requestedMaxDepth = ctx.query.populateDepth ? parseInt(ctx.query.populateDepth as string, 10) : 15;
        const MAX_DEPTH = Math.min(Math.max(1, requestedMaxDepth), 15); // Clamp between 1 and 10
        
        const maxDepth = { value: 0 };
        const populateObject = getDeepPopulate(uid as UID.Schema, {}, 0, maxDepth, new Set(), MAX_DEPTH);
        
        // Check if the content type supports localizations
        const model = strapi.getModel(uid as UID.Schema);
        const hasLocalizations = (model?.pluginOptions as any)?.i18n?.localized;
        
        ctx.query.populate = {
          // @ts-ignores 
          ...populateObject,
          ...(!ctx.request.url.includes("products") && hasLocalizations && { localizations: { populate: {} } })
        };
        
        strapi.log.info(`deepPopulate max depth for ${ctx.request.url}: ${maxDepth.value} (limit: ${MAX_DEPTH})`);
      } catch (error) {
        strapi.log.error('Error in deepPopulate middleware:', error);
      }
    }
    await next();
  };
};