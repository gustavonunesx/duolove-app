import { FlatList, Linking, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Feather } from '@expo/vector-icons';

import { useProducts } from '../../hooks/use-products';
import { useEvents } from '../../hooks/use-events';
import { Skeleton } from '../../components/ui/skeleton';

function ProductCard({ product }: { product: { id: string; name: string; description: string | null; image_url: string | null; affiliate_url: string; price_range: string | null; category: string | null } }) {
  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => Linking.openURL(product.affiliate_url)}
      className="bg-card border border-white/10 rounded-2xl overflow-hidden w-44 mr-3"
    >
      <View className="w-full h-36 bg-white/5">
        {product.image_url ? (
          <Image
            source={{ uri: product.image_url }}
            style={{ width: '100%', height: '100%' }}
            contentFit="cover"
          />
        ) : (
          <View className="flex-1 items-center justify-center">
            <Feather name="gift" size={32} color="#8B8B9E" />
          </View>
        )}
      </View>
      <View className="p-3 gap-1">
        <Text className="text-text-primary text-sm font-semibold" numberOfLines={2}>{product.name}</Text>
        {product.price_range && (
          <Text className="text-primary text-xs font-medium">{product.price_range}</Text>
        )}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => Linking.openURL(product.affiliate_url)}
          className="mt-1 bg-primary/20 border border-primary/40 rounded-xl py-1.5 items-center"
        >
          <Text className="text-primary text-xs font-semibold">Ver produto</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

function ProductSkeletonCard() {
  return (
    <View className="w-44 mr-3 gap-2">
      <Skeleton width={176} height={144} rounded="lg" />
      <Skeleton height={14} rounded="md" />
      <Skeleton height={10} width={80} rounded="md" />
    </View>
  );
}

export default function ProductsScreen() {
  const { products, isLoading } = useProducts();
  const { events } = useEvents();

  const upcomingEvent = events
    .filter((e) => {
      const diff = new Date(e.start_at).getTime() - Date.now();
      return diff > 0 && diff <= 30 * 24 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.start_at).getTime() - new Date(b.start_at).getTime())[0];

  const forOccasion = upcomingEvent
    ? products.filter((p) => p.occasion?.includes(upcomingEvent.type ?? '') || p.occasion?.includes('all'))
    : [];

  const general = upcomingEvent
    ? products.filter((p) => !forOccasion.some((fo) => fo.id === p.id))
    : products;

  return (
    <ScrollView className="flex-1 bg-surface" showsVerticalScrollIndicator={false}>
      <View className="px-5 pt-14 pb-4">
        <View className="flex-row items-center gap-3 mb-1">
          <Text className="text-text-primary text-2xl font-bold">Produtos</Text>
        </View>
        <Text className="text-text-muted text-sm">Presentes e experiências para vocês dois</Text>
      </View>

      {/* Upcoming event banner */}
      {upcomingEvent && (
        <View className="mx-5 mb-5 bg-primary/10 border border-primary/30 rounded-2xl p-4 flex-row items-center gap-3">
          <View className="w-10 h-10 rounded-xl bg-primary/20 items-center justify-center">
            <Feather name="calendar" size={18} color="#E91E8C" />
          </View>
          <View className="flex-1">
            <Text className="text-primary text-xs font-semibold uppercase tracking-wide">Data especial em breve</Text>
            <Text className="text-text-primary text-sm font-medium" numberOfLines={1}>{upcomingEvent.title}</Text>
            <Text className="text-text-muted text-xs">
              {new Date(upcomingEvent.start_at).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long' })}
            </Text>
          </View>
        </View>
      )}

      {/* For occasion section */}
      {(upcomingEvent && (isLoading || forOccasion.length > 0)) && (
        <View className="mb-6">
          <Text className="text-text-primary text-base font-bold px-5 mb-3">
            Perfeito para {upcomingEvent.title}
          </Text>
          {isLoading ? (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
              {[1, 2, 3].map((i) => <ProductSkeletonCard key={i} />)}
            </ScrollView>
          ) : (
            <FlatList
              horizontal
              data={forOccasion}
              keyExtractor={(p) => p.id}
              contentContainerStyle={{ paddingHorizontal: 20 }}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => <ProductCard product={item} />}
            />
          )}
        </View>
      )}

      {/* General section */}
      <View className="mb-8">
        <Text className="text-text-primary text-base font-bold px-5 mb-3">Para qualquer momento</Text>
        {isLoading ? (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
            {[1, 2, 3, 4].map((i) => <ProductSkeletonCard key={i} />)}
          </ScrollView>
        ) : general.length === 0 ? (
          <View className="items-center gap-3 py-10 px-8">
            <Feather name="gift" size={48} color="#8B8B9E" />
            <Text className="text-text-muted text-sm text-center">
              Nenhum produto disponível no momento
            </Text>
          </View>
        ) : (
          <FlatList
            horizontal
            data={general}
            keyExtractor={(p) => p.id}
            contentContainerStyle={{ paddingHorizontal: 20 }}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => <ProductCard product={item} />}
          />
        )}
      </View>

      {/* Affiliate disclaimer */}
      <Text className="text-text-muted text-[10px] text-center px-6 pb-8">
        Alguns links são de afiliados. Ao comprar, você apoia o DuoLove sem custo extra.
      </Text>
    </ScrollView>
  );
}
