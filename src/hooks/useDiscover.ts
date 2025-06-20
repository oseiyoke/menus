import { useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { menuApi } from '@/lib/api/menus';
import type { DiscoverMenusFilters, DiscoverMenusResponse } from '@/lib/types';

export function useDiscoverMenus(filters: DiscoverMenusFilters) {
  return useInfiniteQuery<DiscoverMenusResponse>({
    queryKey: ['discover-menus', filters],
    queryFn: ({ pageParam = 1 }) => menuApi.getDiscoverableMenus(filters, pageParam as number),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) => 
      lastPage.hasMore ? pages.length + 1 : undefined,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useToggleMenuStar() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: menuApi.toggleMenuStar,
    onMutate: async (menuId) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['discover-menus'] });
      
      queryClient.setQueriesData<any>(
        { queryKey: ['discover-menus'] },
        (oldData: any) => {
          if (!oldData?.pages) return oldData;
          
          return {
            ...oldData,
            pages: oldData.pages.map((page: any) => ({
              ...page,
              menus: page.menus.map((menu: any) => 
                menu.id === menuId 
                  ? { 
                      ...menu, 
                      is_starred: !menu.is_starred,
                      star_count: menu.is_starred ? menu.star_count - 1 : menu.star_count + 1
                    }
                  : menu
              )
            }))
          };
        }
      );
    },
    onSuccess: () => {
      // Refresh discover data
      queryClient.invalidateQueries({ queryKey: ['discover-menus'] });
    },
    onError: () => {
      // Revert optimistic update on error
      queryClient.invalidateQueries({ queryKey: ['discover-menus'] });
    }
  });
} 