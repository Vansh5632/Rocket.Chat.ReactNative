import React, { useContext, useEffect, useState } from 'react';
import { View, ViewStyle, Image, FlatList } from 'react-native';
import FastImage from 'react-native-fast-image';

import { isValidUrl } from '../../../../../lib/methods/helpers/isValidUrl';
import { useTheme } from '../../../../../theme';
import styles from '../../../styles';
import OverlayComponent from '../../OverlayComponent';
import { IMessageImage, ImageDimensions, IMessageImages } from './definitions';
import { WidthAwareContext } from '../../WidthAwareView';

const SingleImage = React.memo(({ uri, status, encrypted = false }: IMessageImage) => {
	const { colors } = useTheme();
	const maxSize = useContext(WidthAwareContext); // Use maxSize here
	const [imageDimensions, setImageDimensions] = useState<ImageDimensions>({ width: 0, height: 0 });
	const showImage = isValidUrl(uri) && imageDimensions.width && status === 'downloaded';

	useEffect(() => {
		if (status === 'downloaded') {
			Image.getSize(uri, (width, height) => {
				setImageDimensions(prev => {
					// Avoid redundant updates
					if (prev.width === width && prev.height === height) return prev;
					return { width, height };
				});
			});
		}
	}, [uri, status]);

	const width = Math.min(imageDimensions.width, maxSize) || 0;
	const height = Math.min((imageDimensions.height * ((width * 100) / imageDimensions.width)) / 100, maxSize) || 0;

	const imageStyle = { width, height };
	const containerStyle: ViewStyle = {
		alignItems: 'center',
		justifyContent: 'center',
		...(imageDimensions.width <= 64 && { width: 64 }),
		...(imageDimensions.height <= 64 && { height: 64 })
	};

	const borderStyle: ViewStyle = {
		borderColor: colors.strokeLight,
		borderWidth: 1,
		borderRadius: 4,
		overflow: 'hidden'
	};

	if (encrypted && status === 'downloaded') {
		return (
			<View style={styles.imageContainer}>
				<View style={styles.image} />
				<OverlayComponent loading={false} style={styles.image} iconName='encrypted' />
			</View>
		);
	}

	return (
		<View style={styles.imageContainer}>
			{showImage ? (
				<View style={[containerStyle, borderStyle]}>
					<FastImage style={imageStyle} source={{ uri: encodeURI(uri) }} resizeMode={FastImage.resizeMode.cover} />
				</View>
			) : (
				<View style={[styles.image, borderStyle]} />
			)}
			{(['loading', 'to-download'].includes(status) || (status === 'downloaded' && !showImage)) && (
				<OverlayComponent
					loading={['loading', 'downloaded'].includes(status)}
					style={[styles.image, borderStyle]}
					iconName='arrow-down-circle'
				/>
			)}
		</View>
	);
});

export const MessageImages = React.memo(({ images }: IMessageImages) => {
	const maxSize = useContext(WidthAwareContext);

	const getGridStyle = (count: number): ViewStyle => {
		if (count === 1) return styles.singleImageContainer;
		if (count === 2) return styles.twoImagesContainer;
		if (count === 3) return styles.threeImagesContainer;
		return styles.multipleImagesContainer;
	};

	const renderImage = ({ item }: { item: IMessageImage }) => (
		<SingleImage uri={item.uri} status={item.status} encrypted={item.encrypted} />
	);

	return (
		<View style={[styles.imagesContainer, getGridStyle(images.length)]}>
			<FlatList
				data={images}
				renderItem={renderImage}
				keyExtractor={(item: IMessageImage, index: number) => `${item.uri}-${index}`}
				numColumns={images.length === 2 || images.length >= 4 ? 2 : 1}
				contentContainerStyle={styles.imageListContainer}
				initialNumToRender={4} // Optimize for initial load
				getItemLayout={(data, index) => ({
					length: maxSize / (images.length > 1 ? 2 : 1),
					offset: (maxSize / (images.length > 1 ? 2 : 1)) * index,
					index
				})}
			/>
		</View>
	);
});

MessageImages.displayName = 'MessageImages';
SingleImage.displayName = 'MessageImage';
